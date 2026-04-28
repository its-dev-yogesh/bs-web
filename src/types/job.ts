export type Job = {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  remote: boolean;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  postedAt: string;
};
