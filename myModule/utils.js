import fs from "fs";

export function getContent (filename){
	return new Promise ((ok, error) => {
		fs.readFile (filename, (err, data) => {
			if (err) error (err);

			ok (data);
		});
	});
}
