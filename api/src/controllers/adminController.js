import bcrypt from 'bcryptjs';
import { database } from '../config/database.js';

const listUsers = async (req, res, next) => {
    try {
        const [users] = await database.query(
            "select id, nom, email, role, two_factor_enabled, is_blocked, created_at from users"
        );

        res.json({ users });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { nom, email, password, role } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({
                message: "Nom, email et mot de passe sont obligatoires"
            });
        }

        if (role && !["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Rôle invalide"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "insert into users (nom, email, password, role) values (?, ?, ?, ?)";

        const [result] = await database.query(sql, [nom, email, hashedPassword, role ?? "user"]);

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            id: result.insertId
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

const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Rôle invalide"
            });
        }

        const [result] = await database.query(
            "update users set role = ? where id = ?",
            [role, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        res.json({
            message: "Rôle mis à jour"
        });
    } catch (error) {
        next(error);
    }
};

const setBlockedStatus = async (req, res, next, isBlocked) => {
    const { userId } = req.params;

    if (Number(userId) === req.user.id) {
        return res.status(400).json({
            message: "Tu ne peux pas bloquer ton propre compte"
        });
    }

    const [result] = await database.query(
        "update users set is_blocked = ? where id = ?",
        [isBlocked, userId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Utilisateur introuvable"
        });
    }

    res.json({
        message: isBlocked ? "Compte bloqué" : "Compte débloqué"
    });
};

const blockUser = async (req, res, next) => {
    try {
        await setBlockedStatus(req, res, next, true);
    } catch (error) {
        next(error);
    }
};

const unblockUser = async (req, res, next) => {
    try {
        await setBlockedStatus(req, res, next, false);
    } catch (error) {
        next(error);
    }
};

export { listUsers, createUser, updateUserRole, blockUser, unblockUser };
