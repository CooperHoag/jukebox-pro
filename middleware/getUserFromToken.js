import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";

/** Attaches the user to the request if a valid token is provided */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];
  console.log("auth header:", authorization); // Debug log

  try {
    const { userId } = verifyToken(token);
    const user = await getUserById(userId);
    req.user = user;
    console.log("user attached:", req.user); // Debug log
    next();
  } catch (err) {
    res.status(401).send("Invalid token.");
  }
}

