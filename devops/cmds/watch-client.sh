#! /bin/bash
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$CMDS_DIR/config.sh"

cd "$LOCAL_DEV_DIR" && docker compose exec $ADMIN_APP_SERVICE_NAME bash -c "npm run client-watch"
