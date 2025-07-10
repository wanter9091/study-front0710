export interface Patient {
  id: string
  name: string
  age: number
  guardian: string
  phone: string
  address: string
  registrationDate: string
}

const patients: Patient[] = [
  {
    id: "1",
    name: "김민수",
    age: 7,
    guardian: "김영희",
    phone: "010-1234-5678",
    address: "서울시 강남구",
    registrationDate: "2024-01-15",
  },
  {
    id: "2",
    name: "이서연",
    age: 5,
    guardian: "이철수",
    phone: "010-2345-6789",
    address: "서울시 서초구",
    registrationDate: "2024-01-10",
  },
  {
    id: "3",
    name: "박지훈",
    age: 9,
    guardian: "박미영",
    phone: "010-3456-7890",
    address: "서울시 송파구",
    registrationDate: "2024-01-08",
  },
]

export function getPatients(): Patient[] {
  return patients
}

export function addNewPatient(data: {
  name: string
  age: number
  guardian: string
  phone: string
  address: string
}): Patient {
  const newPatient: Patient = {
    id: (patients.length + 1).toString(),
    ...data,
    registrationDate: new Date().toISOString().split("T")[0],
  }

  patients.push(newPatient)
  return newPatient
}
