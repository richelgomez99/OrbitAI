# Issues Tracker

This file tracks identified issues during the Orbit project migration and development.

| Issue ID | Description | Status | Priority | Date Identified |
|---|---|---|---|---|
| ORBIT-ISSUE-001 | Replit Nix environment configuration (`.replit` file) | Identified | Medium | 2025-05-14 |
| ORBIT-ISSUE-002 | Replit-specific deployment configuration (`.replit` file) | Identified | Medium | 2025-05-14 |
| ORBIT-ISSUE-003 | Replit port mapping (5000 internal to 80 external) | Identified | Medium | 2025-05-14 |
| ORBIT-ISSUE-004 | Replit workflow configurations (`.replit` file) | Identified | Low | 2025-05-14 |
| ORBIT-ISSUE-005 | Missing `DATABASE_URL` environment variable. Project requires a PostgreSQL connection string. Replit-provided instance no longer available. | Blocker | Critical | 2025-05-14 |
| ORBIT-ISSUE-006 | Presence of `.replit` file | Resolved | Medium | 2025-05-14 |
| ORBIT-ISSUE-007 | Replit-specific Vite plugin: `@replit/vite-plugin-cartographer` | Resolved | High | 2025-05-14 |
| ORBIT-ISSUE-008 | Replit-specific Vite plugin: `@replit/vite-plugin-runtime-error-modal` | Resolved | High | 2025-05-14 |
| ORBIT-ISSUE-009 | Supabase Direct DB Hostname DNS Resolution Failure | Blocker | Critical | 2025-05-14 |

*   **Symptoms**: 
    *   `npm run db:push` fails with `Error: getaddrinfo ENOTFOUND db.mcsndedmymfmrfampidb.supabase.co`.
    *   `ping db.mcsndedmymfmrfampidb.supabase.co` results in `cannot resolve ...: Unknown host`.
    *   `nslookup db.mcsndedmymfmrfampidb.supabase.co` (using local and public DNS like 8.8.8.8) results in `*** Can't find ...: No answer`.
*   **Diagnosis**: The specific direct database hostname `db.mcsndedmymfmrfampidb.supabase.co` is not resolving to an IP address in the global DNS system. However, the Supabase *pooler* hostname (`aws-0-us-east-2.pooler.supabase.com`) for the same project *does* resolve correctly.
*   **Conclusion**: This strongly indicates an issue with the DNS records provisioned by Supabase for the direct database hostname. It is not a local user network or configuration problem.
*   **Action Required**: **Contact Supabase Support.** Provide them with:
    1.  Your Project Reference ID: `mcsndedmymfmrfampidb`.
    2.  The failing direct database hostname: `db.mcsndedmymfmrfampidb.supabase.co`.
    3.  The `nslookup` results for both the direct hostname (failure) and the pooler hostname (success).
    4.  Confirmation that the project is active and the hostname matches the dashboard.
*   **Potential Temporary Workaround**: Consider using the Transaction Pooler connection string from the Supabase dashboard in the `.env` file to potentially unblock local development while waiting for Supabase support to resolve the direct hostname DNS issue. The pooler string is `postgresql://postgres.mcsndedmymfmrfampidb:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres`.
