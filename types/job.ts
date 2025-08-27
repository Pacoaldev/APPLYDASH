// export interface Job {
//   id: string;
//   company: string;
//   title: string;
//   appliedDate: string;
//   platform: string;
//   status: 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
//   notes?: string;
// }


// This interface should match the fields in your Prisma `Job` model
export interface Job {
  id: string;
  userid: string;
  company: string | null;
  position: string | null;
  applicationLink: string | null;
  status: string | null; 
  appliedDate: string | null;
  location: string | null;
  platform: string | null;
  salary: string | null;
  notes: string | null;
}

// export type Job = {
//   id: string;
//   userid: string;
//   company: string | null;
//   position: string | null;  // <-- Prisma uses position
//   applicationLink: string | null;
//   status: 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
//   applieddate: string | null; // Date comes as ISO string
//   location: string | null;
//   platform: string | null;
//   salary: string | null;
//   notes: string | null;
//   };
