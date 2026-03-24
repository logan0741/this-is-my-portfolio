-- =====================================================
-- 포트폴리오 데이터베이스 초기화 스크립트
-- =====================================================

CREATE DATABASE IF NOT EXISTS portfolio
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE portfolio;

-- 1. years 테이블 (최상위)
CREATE TABLE IF NOT EXISTS years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_value INT NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. activities 테이블 (하위)
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  year_id INT NOT NULL,
  term VARCHAR(20) NOT NULL COMMENT '1학기, 여름방학, 2학기, 겨울방학',
  category VARCHAR(50) NOT NULL COMMENT '프로젝트, 대회, 캡스톤, 캠프 등',
  title VARCHAR(200) NOT NULL,
  is_awarded BOOLEAN DEFAULT FALSE,
  award_title VARCHAR(200) NULL,
  github_url VARCHAR(500) NULL,
  readme_content TEXT NULL COMMENT 'GitHub README 캐시',
  reflection TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. activity_roles 테이블 (역할 매핑)
CREATE TABLE IF NOT EXISTS activity_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. activity_files 테이블 (파일 참조)
CREATE TABLE IF NOT EXISTS activity_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  file_type ENUM('image', 'certificate') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 인덱스
CREATE INDEX idx_activities_year ON activities(year_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activity_roles_activity ON activity_roles(activity_id);
CREATE INDEX idx_activity_files_activity ON activity_files(activity_id);
