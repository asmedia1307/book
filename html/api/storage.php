<?php
/**
 * Storage API
 * Handles CRUD operations for projects, chapters, and sources
 */

require_once 'config.php';

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setJsonHeaders();
    exit;
}

setJsonHeaders();

// Start session and require authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
requireAuth();

try {
    // Get request body
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['action'])) {
        sendError('Invalid request');
    }

    $action = $input['action'];
    $userId = getCurrentUserId();

    switch ($action) {
        case 'get':
            handleGetAll($userId);
            break;

        case 'saveProject':
            handleSaveProject($input, $userId);
            break;

        case 'updateProject':
            handleUpdateProject($input, $userId);
            break;

        case 'deleteProject':
            handleDeleteProject($input, $userId);
            break;

        case 'saveChapter':
            handleSaveChapter($input, $userId);
            break;

        case 'updateChapter':
            handleUpdateChapter($input, $userId);
            break;

        case 'deleteChapter':
            handleDeleteChapter($input, $userId);
            break;

        case 'saveSource':
            handleSaveSource($input, $userId);
            break;

        case 'deleteSource':
            handleDeleteSource($input, $userId);
            break;

        case 'saveChapterVersion':
            handleSaveChapterVersion($input, $userId);
            break;

        case 'getChapterVersions':
            handleGetChapterVersions($input, $userId);
            break;

        default:
            sendError('Invalid action');
    }

} catch (Exception $e) {
    error_log("Storage error: " . $e->getMessage());
    sendError('An error occurred');
}

/**
 * Get all data for current user
 */
function handleGetAll($userId) {
    try {
        $pdo = getDbConnection();

        // Get projects
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $projects = $stmt->fetchAll();

        // Get chapters
        $stmt = $pdo->prepare("
            SELECT c.* FROM chapters c
            INNER JOIN projects p ON c.project_id = p.id
            WHERE p.user_id = ?
            ORDER BY c.project_id, c.order_num
        ");
        $stmt->execute([$userId]);
        $chapters = $stmt->fetchAll();

        // Get sources
        $stmt = $pdo->prepare("
            SELECT s.* FROM sources s
            INNER JOIN projects p ON s.project_id = p.id
            WHERE p.user_id = ?
            ORDER BY s.added_at DESC
        ");
        $stmt->execute([$userId]);
        $sources = $stmt->fetchAll();

        sendJsonResponse([
            'success' => true,
            'projects' => $projects,
            'chapters' => $chapters,
            'sources' => $sources
        ]);

    } catch (Exception $e) {
        error_log("Get all error: " . $e->getMessage());
        sendError('Failed to retrieve data');
    }
}

/**
 * Save new project
 */
function handleSaveProject($input, $userId) {
    if (!isset($input['project'])) {
        sendError('Project data required');
    }

    $project = $input['project'];

    if (!isset($project['title']) || !isset($project['field']) ||
        !isset($project['audience']) || !isset($project['tone'])) {
        sendError('Missing required project fields');
    }

    try {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare("
            INSERT INTO projects (user_id, title, field, audience, tone)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            sanitizeInput($project['title']),
            sanitizeInput($project['field']),
            sanitizeInput($project['audience']),
            sanitizeInput($project['tone'])
        ]);

        $projectId = $pdo->lastInsertId();

        // Get created project
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $createdProject = $stmt->fetch();

        sendJsonResponse([
            'success' => true,
            'project' => $createdProject
        ]);

    } catch (Exception $e) {
        error_log("Save project error: " . $e->getMessage());
        sendError('Failed to save project');
    }
}

/**
 * Update existing project
 */
function handleUpdateProject($input, $userId) {
    if (!isset($input['project']) || !isset($input['project']['id'])) {
        sendError('Project ID required');
    }

    $project = $input['project'];

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$project['id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Project not found', 404);
        }

        $stmt = $pdo->prepare("
            UPDATE projects
            SET title = ?, field = ?, audience = ?, tone = ?
            WHERE id = ? AND user_id = ?
        ");

        $stmt->execute([
            sanitizeInput($project['title']),
            sanitizeInput($project['field']),
            sanitizeInput($project['audience']),
            sanitizeInput($project['tone']),
            $project['id'],
            $userId
        ]);

        sendJsonResponse(['success' => true]);

    } catch (Exception $e) {
        error_log("Update project error: " . $e->getMessage());
        sendError('Failed to update project');
    }
}

/**
 * Delete project
 */
function handleDeleteProject($input, $userId) {
    if (!isset($input['id'])) {
        sendError('Project ID required');
    }

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$input['id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Project not found', 404);
        }

        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$input['id'], $userId]);

        sendJsonResponse(['success' => true]);

    } catch (Exception $e) {
        error_log("Delete project error: " . $e->getMessage());
        sendError('Failed to delete project');
    }
}

/**
 * Save new chapter
 */
function handleSaveChapter($input, $userId) {
    if (!isset($input['chapter'])) {
        sendError('Chapter data required');
    }

    $chapter = $input['chapter'];

    if (!isset($chapter['project_id']) || !isset($chapter['title']) || !isset($chapter['topic'])) {
        sendError('Missing required chapter fields');
    }

    try {
        $pdo = getDbConnection();

        // Verify project ownership
        $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$chapter['project_id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Project not found', 404);
        }

        $stmt = $pdo->prepare("
            INSERT INTO chapters (project_id, title, topic, order_num, word_target, outline, content, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $chapter['project_id'],
            sanitizeInput($chapter['title']),
            sanitizeInput($chapter['topic']),
            $chapter['order_num'] ?? 0,
            $chapter['word_target'] ?? 2000,
            $chapter['outline'] ?? null,
            $chapter['content'] ?? null,
            $chapter['status'] ?? 'draft'
        ]);

        $chapterId = $pdo->lastInsertId();

        // Get created chapter
        $stmt = $pdo->prepare("SELECT * FROM chapters WHERE id = ?");
        $stmt->execute([$chapterId]);
        $createdChapter = $stmt->fetch();

        sendJsonResponse([
            'success' => true,
            'chapter' => $createdChapter
        ]);

    } catch (Exception $e) {
        error_log("Save chapter error: " . $e->getMessage());
        sendError('Failed to save chapter');
    }
}

/**
 * Update existing chapter
 */
function handleUpdateChapter($input, $userId) {
    if (!isset($input['chapter']) || !isset($input['chapter']['id'])) {
        sendError('Chapter ID required');
    }

    $chapter = $input['chapter'];

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT c.id FROM chapters c
            INNER JOIN projects p ON c.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$chapter['id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Chapter not found', 404);
        }

        $stmt = $pdo->prepare("
            UPDATE chapters
            SET title = ?, topic = ?, order_num = ?, word_target = ?,
                outline = ?, content = ?, status = ?
            WHERE id = ?
        ");

        $stmt->execute([
            sanitizeInput($chapter['title']),
            sanitizeInput($chapter['topic']),
            $chapter['order_num'],
            $chapter['word_target'],
            $chapter['outline'],
            $chapter['content'],
            $chapter['status'],
            $chapter['id']
        ]);

        sendJsonResponse(['success' => true]);

    } catch (Exception $e) {
        error_log("Update chapter error: " . $e->getMessage());
        sendError('Failed to update chapter');
    }
}

/**
 * Delete chapter
 */
function handleDeleteChapter($input, $userId) {
    if (!isset($input['id'])) {
        sendError('Chapter ID required');
    }

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT c.id FROM chapters c
            INNER JOIN projects p ON c.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$input['id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Chapter not found', 404);
        }

        $stmt = $pdo->prepare("DELETE FROM chapters WHERE id = ?");
        $stmt->execute([$input['id']]);

        sendJsonResponse(['success' => true]);

    } catch (Exception $e) {
        error_log("Delete chapter error: " . $e->getMessage());
        sendError('Failed to delete chapter');
    }
}

/**
 * Save research source
 */
function handleSaveSource($input, $userId) {
    if (!isset($input['source'])) {
        sendError('Source data required');
    }

    $source = $input['source'];

    if (!isset($source['project_id']) || !isset($source['topic']) || !isset($source['content'])) {
        sendError('Missing required source fields');
    }

    try {
        $pdo = getDbConnection();

        // Verify project ownership
        $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$source['project_id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Project not found', 404);
        }

        $stmt = $pdo->prepare("
            INSERT INTO sources (project_id, topic, content, url)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $source['project_id'],
            sanitizeInput($source['topic']),
            $source['content'], // Don't sanitize - preserve research content
            $source['url'] ?? null
        ]);

        $sourceId = $pdo->lastInsertId();

        // Get created source
        $stmt = $pdo->prepare("SELECT * FROM sources WHERE id = ?");
        $stmt->execute([$sourceId]);
        $createdSource = $stmt->fetch();

        sendJsonResponse([
            'success' => true,
            'source' => $createdSource
        ]);

    } catch (Exception $e) {
        error_log("Save source error: " . $e->getMessage());
        sendError('Failed to save source');
    }
}

/**
 * Delete source
 */
function handleDeleteSource($input, $userId) {
    if (!isset($input['id'])) {
        sendError('Source ID required');
    }

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT s.id FROM sources s
            INNER JOIN projects p ON s.project_id = p.id
            WHERE s.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$input['id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Source not found', 404);
        }

        $stmt = $pdo->prepare("DELETE FROM sources WHERE id = ?");
        $stmt->execute([$input['id']]);

        sendJsonResponse(['success' => true]);

    } catch (Exception $e) {
        error_log("Delete source error: " . $e->getMessage());
        sendError('Failed to delete source');
    }
}

/**
 * Save chapter version
 */
function handleSaveChapterVersion($input, $userId) {
    if (!isset($input['chapter_id']) || !isset($input['content'])) {
        sendError('Chapter ID and content required');
    }

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT c.id FROM chapters c
            INNER JOIN projects p ON c.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$input['chapter_id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Chapter not found', 404);
        }

        // Get next version number
        $stmt = $pdo->prepare("SELECT MAX(version_num) as max_version FROM chapter_versions WHERE chapter_id = ?");
        $stmt->execute([$input['chapter_id']]);
        $result = $stmt->fetch();
        $nextVersion = ($result['max_version'] ?? 0) + 1;

        // Save version
        $stmt = $pdo->prepare("
            INSERT INTO chapter_versions (chapter_id, content, version_num)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$input['chapter_id'], $input['content'], $nextVersion]);

        sendJsonResponse(['success' => true, 'version' => $nextVersion]);

    } catch (Exception $e) {
        error_log("Save version error: " . $e->getMessage());
        sendError('Failed to save version');
    }
}

/**
 * Get chapter versions
 */
function handleGetChapterVersions($input, $userId) {
    if (!isset($input['chapter_id'])) {
        sendError('Chapter ID required');
    }

    try {
        $pdo = getDbConnection();

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT c.id FROM chapters c
            INNER JOIN projects p ON c.project_id = p.id
            WHERE c.id = ? AND p.user_id = ?
        ");
        $stmt->execute([$input['chapter_id'], $userId]);
        if (!$stmt->fetch()) {
            sendError('Chapter not found', 404);
        }

        // Get versions
        $stmt = $pdo->prepare("
            SELECT * FROM chapter_versions
            WHERE chapter_id = ?
            ORDER BY version_num DESC
        ");
        $stmt->execute([$input['chapter_id']]);
        $versions = $stmt->fetchAll();

        sendJsonResponse([
            'success' => true,
            'versions' => $versions
        ]);

    } catch (Exception $e) {
        error_log("Get versions error: " . $e->getMessage());
        sendError('Failed to get versions');
    }
}
