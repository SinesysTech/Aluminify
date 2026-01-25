/**
 * Central export point for Pessoas (People) services.
 * Use this barrel file for importing services in consumers.
 */
export * from "./user-base.service";
export * from "./student.types";
export * from "./student.service";
export * from "./student.repository";
export * from "./errors";
export * from "./student-import.service";
// Transfer services
export * from "./student-transfer.types";
export * from "./student-transfer.repository";
export * from "./student-transfer.service";
// Template services
export * from "./student-template.service";
// Organization services
export * from "./student-organizations.service";

// Teacher services
export * from "./teacher.types";
export * from "./teacher.service";
export * from "./teacher.repository";
