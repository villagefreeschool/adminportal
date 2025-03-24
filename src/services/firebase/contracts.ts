import _ from 'lodash';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { db } from './core';
import { yearDB } from './collections';
import { Contract, Enrollment, Family } from './models/types';
import { fetchFamiliesWithIDs } from './families';
import { calculatedNameForFamily, guardianNamesForFamily } from './families';

/**
 * Fetch all contracts for a specific year
 * @param yearID The year ID to fetch contracts for
 * @returns Promise resolving to an array of Contract objects
 */
export async function fetchContracts(yearID: string): Promise<Contract[]> {
  try {
    const contractsCollection = collection(doc(yearDB, yearID), 'contracts');
    const querySnapshot = await getDocs(contractsCollection);
    const contracts: Contract[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contracts.push({
        id: doc.id, // This is also the familyID
        familyID: doc.id,
        yearID,
        ...data,
      } as Contract);
    });

    return contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
}

/**
 * Fetch a specific contract
 * @param yearID The year ID
 * @param familyID The family ID (also used as the contract ID)
 * @returns Promise resolving to a Contract object or null if not found
 */
export async function fetchContract(yearID: string, familyID: string): Promise<Contract | null> {
  try {
    const contractRef = doc(collection(doc(yearDB, yearID), 'contracts'), familyID);
    const contractSnapshot = await getDoc(contractRef);

    if (!contractSnapshot.exists()) {
      return null;
    }

    return {
      id: contractSnapshot.id,
      familyID,
      yearID,
      ...contractSnapshot.data(),
    } as Contract;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
}

/**
 * Save a contract to Firestore
 * @param contract The contract to save
 * @returns Promise resolving to the saved contract
 */
export async function saveContract(contract: Contract): Promise<Contract> {
  try {
    const { id, yearID, familyID, ...contractData } = contract;

    // Use familyID as the document ID
    const contractRef = doc(collection(doc(yearDB, yearID), 'contracts'), familyID);

    await setDoc(contractRef, contractData);

    return contract;
  } catch (error) {
    console.error('Error saving contract:', error);
    throw error;
  }
}

/**
 * Delete a contract from Firestore
 * @param yearID The year ID
 * @param familyID The family ID (also used as the contract ID)
 * @returns Promise that resolves when the contract is deleted
 */
export async function deleteContract(yearID: string, familyID: string): Promise<void> {
  try {
    const contractRef = doc(collection(doc(yearDB, yearID), 'contracts'), familyID);
    await deleteDoc(contractRef);
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
}

/**
 * Fetch a contract from the previous school year
 * @param yearID The current year ID
 * @param familyID The family ID
 * @returns Promise resolving to the previous year's contract or null if not found
 */
export async function fetchPreviousYearContract(
  yearID: string,
  familyID: string,
): Promise<Contract | null> {
  try {
    // Import findPreviousYearId to avoid circular dependencies
    const { findPreviousYearId } = await import('./years');

    // Find the previous year ID
    const previousYearID = await findPreviousYearId(yearID);

    if (!previousYearID) {
      console.log('No previous year found for year ID:', yearID);
      return null;
    }

    // Fetch contract from previous year
    const previousContract = await fetchContract(previousYearID, familyID);
    return previousContract;
  } catch (error) {
    console.error('Error fetching previous year contract:', error);
    return null;
  }
}

/**
 * Calculate the number of students in a contract
 * @param contract The contract to calculate for
 * @returns The number of students enrolled full-time or part-time
 */
export function studentCountForContract(contract: Contract): number {
  const decisionValues = Object.values(contract.studentDecisions);
  return decisionValues.filter((value) => value === 'Full Time' || value === 'Part Time').length;
}

/**
 * Prepare contracts for display by adding family information and enrollment details
 * @param contracts The contracts to prepare
 * @param families The families to use for enrichment
 * @param enrollments The enrollments to use for enrichment
 * @returns Enriched contracts with additional display information
 */
export async function prepareContractsForDisplay(
  contracts: Contract[],
  families: Family[],
  enrollments: Enrollment[],
): Promise<Contract[]> {
  // Map families by ID for quick lookup
  const familiesById = _.keyBy(families, 'id');

  // Process each contract to add display information
  return contracts.map((contract) => {
    const family = familiesById[contract.familyID];

    // Get enrollments for this family
    const familyEnrollments = enrollments.filter((e) => e.familyID === contract.familyID);

    // Filter part time and full time students
    const partTimers = familyEnrollments.filter((e) => e.enrollmentType === 'Part Time');
    const fullTimers = familyEnrollments.filter((e) => e.enrollmentType === 'Full Time');

    // Calculate family display name and guardian names
    const calculatedName = family ? calculatedNameForFamily(family) : '';
    const guardianNames = family ? guardianNamesForFamily(family) : '';

    // Return enriched contract
    return {
      ...contract,
      familyName: calculatedName || contract.familyName || '',
      familyNameAndGuardians: `${calculatedName} (${guardianNames})`,
      family,
      fullTimeNames: fullTimers.map((e) => e.studentName).join(', '),
      partTimeNames: partTimers.map((e) => e.studentName).join(', '),
    };
  });
}
