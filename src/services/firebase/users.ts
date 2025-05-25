import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./core";
import type { VFSAdminUser } from "./models/types";

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<VFSAdminUser[]> {
  try {
    // Ensure we're using the correct collection reference
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    const users: VFSAdminUser[] = [];

    if (querySnapshot.empty) {
      return [];
    }

    for (const docSnapshot of querySnapshot.docs) {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as Omit<VFSAdminUser, "email">;
        users.push({
          ...data,
          email: docSnapshot.id,
          isAdmin: data.isAdmin ?? false,
          isStaff: data.isStaff ?? false,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
        });
      }
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Fetch a single user by email
 */
export async function fetchUser(email: string): Promise<VFSAdminUser | null> {
  try {
    // Use direct collection reference
    const userDoc = await getDoc(doc(collection(db, "users"), email));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      ...userData,
      email: userDoc.id,
      isAdmin: userData.isAdmin ?? false,
      isStaff: userData.isStaff ?? false,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
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
    if (!user.email) {
      throw new Error("User email is required");
    }

    // Create a copy of the user object with boolean values ensured
    const userCopy = { ...user };

    // Convert isAdmin and isStaff to boolean values
    userCopy.isAdmin = Boolean(userCopy.isAdmin);
    userCopy.isStaff = Boolean(userCopy.isStaff);

    // Ensure firstName and lastName are strings
    userCopy.firstName = String(userCopy.firstName || "");
    userCopy.lastName = String(userCopy.lastName || "");

    // Create a copy of the data to save, excluding the email
    const userToSave = {
      firstName: userCopy.firstName,
      lastName: userCopy.lastName,
      isAdmin: userCopy.isAdmin,
      isStaff: userCopy.isStaff,
    };

    // Email is used as the document ID - use direct collection reference
    await setDoc(doc(collection(db, "users"), user.email), userToSave);
    return { ...userToSave, email: user.email };
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
}
