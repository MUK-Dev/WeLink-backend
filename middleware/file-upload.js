const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
	"audio/mp3": "mp3",
	"video/mp4": "mp4",
};

const fileUpload = multer({
	limits: 52428800,
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			if (file.mimetype === "audio/mp3") {
				cb(null, "uploads/audios");
			} else if (
				file.mimetype === "image/png" ||
				file.mimetype === "image/jpeg" ||
				file.mimetype === "image/jpg"
			) {
				cb(null, "uploads/images");
			} else if (file.mimetype === "video/mp4") {
				cb(null, "uploads/videos");
			} else {
				cb({ error: "File not supported" });
			}
		},
		filename: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype];
			cb(null, uuidv1() + "." + ext);
		},
	}),
});

module.exports = fileUpload;
