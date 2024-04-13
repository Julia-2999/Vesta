const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

exports.removeUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const uid = String(req.body.uid);

    if (!uid) {
      res.status(400).json({error: "Brak wymaganego parametru uid"});
      return;
    }

    const userRef =
        await admin.firestore().collection("users").doc(uid).get();
    const userData = userRef.data();

    if (userData && userData.role === "admin") {
      console.error("Nie można usunąć administratora.");
      res.status(403).json({error: "Nie można usunąć administratora."});
      return;
    }

    try {
      await admin.auth().deleteUser(uid);
      res.status(200).json({success: true});
    } catch (error) {
      console
          .error("Błąd podczas usuwania użytkownika z Firebase Auth:", error);
      res.status(500).json({error: "Błąd podczas usuwania użytkownika"});
    }
  });
});

exports.addUser = functions.https.onCall(async (data, context) => {
  try {
    const {uid, email, displayName} = data;

    const userRecord = await admin.auth().createUser({
      uid,
      email,
      displayName,
    });

    console.log("Użytkownik dodany pomyślnie:", userRecord.uid);

    await admin.auth().generateEmailVerificationLink(email);

    return {success: true};
  } catch (error) {
    console.error("Błąd podczas dodawania użytkownika:", error);
    throw new functions.https
        .HttpsError("internal", "Błąd podczas dodawania użytkownika");
  }
});
