 export class User {
  constructor(id, email, passwordHash, role = "customer") {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  isAdmin() {
    return this.role === "admin";
  }
}