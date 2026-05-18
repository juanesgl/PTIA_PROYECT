import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StudentContextType {
  studentId: string;
  setStudentId: (id: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  // Using the hardcoded student ID from curriculum.json
  const [studentId, setStudentId] = useState<string>('00000000-0000-0000-0000-000000000001');

  return (
    <StudentContext.Provider value={{ studentId, setStudentId }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
