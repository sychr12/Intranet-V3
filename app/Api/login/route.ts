import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

export async function POST(req: Request) {
  let connection; // define antes para poder fechar depois, mesmo em erro

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Usuário e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Conexão com o banco dentro do container Docker
    connection = await mysql.createConnection({
      host: "db", // nome do serviço do banco no docker-compose.yml
      user: "root",
      password: "root",
      database: "intranet",
      port: 3306, // garante que a porta está correta
    });

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
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno no servidor." },
      { status: 500 }
    );
  } finally {
    // Fecha a conexão mesmo em caso de erro
    if (connection) {
      await connection.end();
    }
  }
}
