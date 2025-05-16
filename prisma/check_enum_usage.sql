-- Check for tasks with URGENT priority
SELECT COUNT(*) as urgent_tasks_count
FROM "Task"
WHERE priority = 'URGENT';

-- Check for tasks with ARCHIVED status
SELECT COUNT(*) as archived_tasks_count
FROM "Task"
WHERE status = 'ARCHIVED';
