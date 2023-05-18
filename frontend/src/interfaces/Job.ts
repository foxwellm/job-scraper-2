export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  href: string;
  isDeleted: boolean;
  hasApplied: boolean;
  scrapeLocation: string;
}
