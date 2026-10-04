/** *const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.countBooks = onRequest({cors: true}, async (request, response) => {
  try {
    const snapshot = await admin.firestore().collection("books").get();

    response.status(200).json({
      count: snapshot.size,
    });
  } catch (error) {
    console.error("Error fetching book count:", error);

    response.status(500).json({
      error: "Error fetching book count",
    });
  }
});***/

const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.countBooks = onRequest({cors: true}, async (request, response) => {
  try {
    const snapshot = await admin.firestore().collection("books").get();

    response.status(200).json({
      count: snapshot.size,
    });
  } catch (error) {
    console.error("Error fetching book count:", error);

    response.status(500).json({
      error: "Error fetching book count",
    });
  }
});

exports.capitalizeBook = onDocumentCreated(
    {
      document: "books/{bookId}",
      region: "australia-southeast1",
    },
    async (event) => {
      const snapshot = event.data;

      if (!snapshot) {
        return;
      }

      const updates = {};

      for (const [key, value] of Object.entries(snapshot.data())) {
        if (typeof value === "string") {
          updates[key] = value.toUpperCase();
        }
      }

      if (Object.keys(updates).length > 0) {
        await snapshot.ref.update(updates);
      }
    },
);
