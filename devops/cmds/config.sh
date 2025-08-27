#! /bin/bash
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$(cd "$CMDS_DIR/../.." && pwd)"
SERVICES_DIR="$(cd "$ROOT_DIR/services" && pwd)"
LOCAL_DEV_DIR="$(cd "$ROOT_DIR/devops/compose/open-access-fund-local-dev" && pwd)"
ADMIN_APP_SERVICE_NAME="admin-app"
