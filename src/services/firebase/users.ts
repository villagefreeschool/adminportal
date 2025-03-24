import { doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { VFSAdminUser } from './models/types';
import { userDB } from './collections';

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<VFSAdminUser[]> {
  try {
    const querySnapshot = await getDocs(userDB);
    const users: VFSAdminUser[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<VFSAdminUser, 'email'>;
      users.push({
        ...data,
        email: doc.id,
        isAdmin: data.isAdmin ?? false,
        isStaff: data.isStaff ?? false,
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Fetch a single user by email
 */
export async function fetchUser(email: string): Promise<VFSAdminUser | null> {
  try {
    const userDoc = await getDoc(doc(userDB, email));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      ...userData,
      email: userDoc.id,
      isAdmin: userData.isAdmin ?? false,
      isStaff: userData.isStaff ?? false,
    } as VFSAdminUser;
  } catch (error) {
    console.error(`Error fetching user ${email}:`, error);
    throw error;
  }
}

/**
 * Save a user (create or update)
 */
export async function saveUser(user: VFSAdminUser): Promise<VFSAdminUser> {
  try {
    // Create a copy of the user object with boolean values ensured
    const userCopy = { ...user };

    // Convert isAdmin and isStaff to boolean values
    userCopy.isAdmin = Boolean(userCopy.isAdmin);
    userCopy.isStaff = Boolean(userCopy.isStaff);

    // Remove email from the data to save (it's used as the document ID)
    const { email, ...userDataToSave } = userCopy;
    const userToSave = userDataToSave;

    // Email is used as the document ID
    await setDoc(doc(userDB, user.email), userToSave);
    return userToSave;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}
