import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { database } from '../config/database.js';

function isTotpCodeValid(secret, code) {
    return verifySync({ secret, token: code }).valid;
}

function issueAccessToken(res, user) {
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    });
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const sql = "select * from users where email = ?";

        const [results] = await database.query(sql, [email]);

        if (results.length === 0) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        const user = results[0];

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        if (user.is_blocked) {
            return res.status(403).json({
                message: "Ce compte a été bloqué"
            });
        }

        if (user.two_factor_enabled) {
            const pendingToken = jwt.sign(
                { id: user.id, twoFactorPending: true },
                process.env.JWT_SECRET,
                { expiresIn: "5m" }
            );

            res.cookie("twoFactorPendingToken", pendingToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 5 * 60 * 1000
            });

            return res.json({
                message: "Code d'authentification à deux facteurs requis",
                twoFactorRequired: true
            });
        }

        issueAccessToken(res, user);

        res.json({
            message: "connexion réussie"
        });
    } catch (error) {
        next(error);
    }
};

const verifyLogin2fa = async (req, res, next) => {
    try {
        const pendingToken = req.cookies.twoFactorPendingToken;

        if (!pendingToken) {
            return res.status(401).json({
                message: "Authentification à deux facteurs non initiée"
            });
        }

        let payload;
        try {
            payload = jwt.verify(pendingToken, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                message: "Session d'authentification à deux facteurs expirée"
            });
        }

        if (!payload.twoFactorPending) {
            return res.status(401).json({
                message: "Jeton invalide"
            });
        }

        const { code } = req.body;
        const sql = "select * from users where id = ?";
        const [results] = await database.query(sql, [payload.id]);

        if (results.length === 0 || !results[0].two_factor_enabled) {
            return res.status(401).json({
                message: "Authentification à deux facteurs indisponible"
            });
        }

        const user = results[0];

        if (user.is_blocked) {
            return res.status(403).json({
                message: "Ce compte a été bloqué"
            });
        }

        const codeValid = isTotpCodeValid(user.two_factor_secret, code);

        if (!codeValid) {
            return res.status(401).json({
                message: "Code d'authentification incorrect"
            });
        }

        res.clearCookie("twoFactorPendingToken");
        issueAccessToken(res, user);

        res.json({
            message: "connexion réussie"
        });
    } catch (error) {
        next(error);
    }
};

const setup2fa = async (req, res, next) => {
    try {
        const secret = generateSecret();
        const sql = "update users set two_factor_secret = ?, two_factor_enabled = false where id = ?";

        await database.query(sql, [secret, req.user.id]);

        const [users] = await database.query("select email from users where id = ?", [req.user.id]);
        const label = users[0]?.email ?? String(req.user.id);
        const otpauthUrl = generateURI({ issuer: "ProjetSpe4", label, secret });
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

        res.json({
            message: "Scanne ce QR code avec ton application d'authentification",
            qrCode: qrCodeDataUrl,
            secret
        });
    } catch (error) {
        next(error);
    }
};

const enable2fa = async (req, res, next) => {
    try {
        const { code } = req.body;
        const sql = "select two_factor_secret from users where id = ?";
        const [results] = await database.query(sql, [req.user.id]);

        if (results.length === 0 || !results[0].two_factor_secret) {
            return res.status(400).json({
                message: "Configuration de l'authentification à deux facteurs non initiée"
            });
        }

        const codeValid = isTotpCodeValid(results[0].two_factor_secret, code);

        if (!codeValid) {
            return res.status(401).json({
                message: "Code d'authentification incorrect"
            });
        }

        await database.query("update users set two_factor_enabled = true where id = ?", [req.user.id]);

        res.json({
            message: "Authentification à deux facteurs activée"
        });
    } catch (error) {
        next(error);
    }
};

const disable2fa = async (req, res, next) => {
    try {
        await database.query(
            "update users set two_factor_enabled = false, two_factor_secret = null where id = ?",
            [req.user.id]
        );

        res.json({
            message: "Authentification à deux facteurs désactivée"
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {

    res.clearCookie("accessToken");

    res.json({
        message: "Déconnexion réussie"
    });
};

const getProfile = async (req, res, next) => {
    try {
        const sql = "select id, nom, email, role, two_factor_enabled from users where id = ?";
        const [results] = await database.query(sql, [req.user.id]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({
            message: "Bienvenue sur ton profil",
            user: results[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { nom, email } = req.body;
        await database.query("update users set nom = ?, email = ? where id = ?", [nom, email, req.user.id]);

        const [results] = await database.query(
            "select id, nom, email, role, two_factor_enabled from users where id = ?",
            [req.user.id]
        );

        res.json({
            message: "Profil mis à jour",
            user: results[0]
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Cette adresse email est déjà utilisée"
            });
        }
        next(error);
    }
};

export { login, logout, verifyLogin2fa, setup2fa, enable2fa, disable2fa, getProfile, updateProfile };