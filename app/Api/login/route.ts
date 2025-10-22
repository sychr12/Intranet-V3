import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

export async function POST(req: Request) {
  let connection: mysql.Connection | null = null;

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Usuário e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Cria a conexão com o banco MySQL (dentro do Docker)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "db", // nome do serviço no docker-compose
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "root",
      database: process.env.MYSQL_DATABASE || "intranet",
      port: 3306,
    });

    // Espera 1 segundo se o banco estiver inicializando (resolve erro "ECONNREFUSED")
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Executa a consulta
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE username = ? AND password = ? LIMIT 1",
      [username, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login realizado com sucesso!",
      user: rows[0],
    });
  } catch (error: any) {
    console.error("Erro no login:", error.message || error);
    return NextResponse.json(
      { success: false, message: "Erro ao conectar ao banco de dados." },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
