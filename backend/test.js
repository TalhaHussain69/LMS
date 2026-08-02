const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "12qw",
      database: "std_manage",
    });

    console.log("Connected Successfully");
    await conn.end();
  } catch (err) {
    console.log(err);
  }
})();