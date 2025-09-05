import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectToDatabase();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password required." }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await User.create({ id, email, hashedPassword });

  return NextResponse.json({ message: "User created successfully." }, { status: 201 });
}
