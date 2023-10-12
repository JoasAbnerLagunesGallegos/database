const usersModel = {
    getAll: `SELECT 
                * 
            FROM 
                users
                `,
    getByID:` SELECT
                *
            FROM
                users
                    WHERE
                        id=?
    
    `,
    addRow:`
            INSERT INTO
            users (
                username,
                email,
                password,
                name,
                lastname,
                phone_number,
                role_id,
                is_active
            )
            VALUES(
                ?,?,?,?,?,?,?,?
            )`,
};

module.exports = usersModel;