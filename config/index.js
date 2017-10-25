export const server = {
	port: 3000,
	host: "localhost"
};
export const dbserver = {
	port: 5432,
	host: "localhost",
	dbname: "dbtest"
};

export const session = {
	secret: "QWERTY123$",
	key: "sid",
	cookie: {
		path: "/",
		httpOnly: true,
		maxAge: null
	},
	dbURL: "postgres://localhost:5432/dbtest",
	table: "session"
}
