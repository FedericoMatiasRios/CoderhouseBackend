import multer from 'multer';
import { userDAO, userModel } from '../dao/mongo/models/user.model.js';
import { sendPasswordRecoveryEmail } from './pw-recovery.controller.js';
import { webRouter } from './base.controller.js';

export async function controladorUsersGet(request, response) {
  try {
    let data = await userDAO.getAll();
    const limit = parseInt(request.query.limit);
    request.logger.info(data);

    const users = data.docs;

    if (limit) {
      users = users.slice(0, limit);
    }

    const basicUserInfo = users.map(user => ({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    }));

    response.json(basicUserInfo);
  } catch (err) {
    request.logger.error(err);
    response.status(500).json({ error: 'Internal server error.' });
  }
}

export async function deleteInactiveUsers(request, response) {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    //twoDaysAgo.setMinutes(twoDaysAgo.getMinutes() - 8);

    const result = await userDAO.getAll();
    const users = result.docs;

    const deletedUserIds = [];
    const errors = [];

    for (const user of users) {
      try {
        if (user.last_connection instanceof Date || user.last_connection === null) {
          if (user.last_connection === null || user.last_connection < twoDaysAgo) {
            await userDAO.delete(user._id);
            deletedUserIds.push(user._id);

            if (user.last_connection !== null) {
              const emailSubject = 'Account Deletion Due to Inactivity';
              const emailBody = `${user.first_name},\n\nYour account has been deleted due to inactivity.`;
              await sendPasswordRecoveryEmail(user.email, emailSubject, emailBody);
            }
          }
        }
      } catch (error) {
        errors.push({ userId: user._id, error: error.message });
        console.error(`Error deleting user ${user._id}:`, error);
      }
    }

    response.json({ message: `${deletedUserIds.length} users deleted successfully.`, errors });
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: 'Internal server error.' });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, 'public/uploads/profiles/');
    } else if (file.fieldname === 'productImage') {
      cb(null, 'public/uploads/products/');
    } else {
      cb(null, 'storage/uploads/documents/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split('/')[1];
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'productImage', maxCount: 5 },
  { name: 'identification', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'accountStatement', maxCount: 1 }
]);

export const controladorUploadDocuments = async (req, res) => {
  const userId = req.params.uid;

  const { profileImage, productImage, identification, proofOfAddress, accountStatement } = req.files;

  try {
    const existingUser = await userModel.findById(userId);

    if (profileImage) {
      const existingProfileImageIndex = existingUser.documents.findIndex(
        (doc) => doc.name === 'profileImage'
      );

      if (existingProfileImageIndex !== -1) {
        existingUser.documents[existingProfileImageIndex].reference = profileImage[0].path;
      } else {
        existingUser.documents.push({ name: 'profileImage', reference: profileImage[0].path });
      }
    }

    if (productImage) {
      productImage.forEach((image) => {
        existingUser.documents.push({ name: 'productImage', reference: image.path });
      });
    }

    if (identification) {
      const existingIdentificationIndex = existingUser.documents.findIndex(
        (doc) => doc.name === 'identification'
      );

      if (existingIdentificationIndex !== -1) {
        existingUser.documents[existingIdentificationIndex].reference = identification[0].path;
      } else {
        existingUser.documents.push({ name: 'identification', reference: identification[0].path });
      }
    }

    if (proofOfAddress) {
      const existingProofOfAddressIndex = existingUser.documents.findIndex(
        (doc) => doc.name === 'proofOfAddress'
      );

      if (existingProofOfAddressIndex !== -1) {
        existingUser.documents[existingProofOfAddressIndex].reference = proofOfAddress[0].path;
      } else {
        existingUser.documents.push({ name: 'proofOfAddress', reference: proofOfAddress[0].path });
      }
    }

    if (accountStatement) {
      const existingAccountStatementIndex = existingUser.documents.findIndex(
        (doc) => doc.name === 'accountStatement'
      );

      if (existingAccountStatementIndex !== -1) {
        existingUser.documents[existingAccountStatementIndex].reference = accountStatement[0].path;
      } else {
        existingUser.documents.push({ name: 'accountStatement', reference: accountStatement[0].path });
      }
    }

    const updatedUser = await existingUser.save();

    console.log(updatedUser);

    res.status(200).json({ message: 'Files uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const controladorSwitchRole = async (req, res) => {
  const userId = req.params.uid;

  try {
    const user = await userModel.findById(userId);
    const requiredDocuments = ['identification', 'proofOfAddress', 'accountStatement'];
    const uploadedDocuments = user.documents.map(doc => doc.name);
    const isAllDocumentsUploaded = requiredDocuments.every(doc => uploadedDocuments.includes(doc));

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log('user role is: ', user.role);

    if (!isAllDocumentsUploaded && user.role == 'user') {
      return res.status(404).json({ error: 'Some required documents have not been uploaded.' });
    }

    if (user.role === 'user') {
      user.role = 'premium';
    } else if (user.role === 'premium') {
      user.role = 'user';
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User role updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

webRouter.get('/users', async (req, res) => {
  try {
    let users = await userDAO.getAll();

    const payload = {
      users: users,
    };

    res.render('realTimeUsers', payload);
  } catch (err) {
    req.logger.debug(err);
  }
});