# マイグレーションを焼き込んだ PostgreSQL。
#
# /docker-entrypoint-initdb.d/*.sql は「空のデータディレクトリでの初回起動時のみ」
# 実行される。やり直すときは docker compose down -v。
FROM postgres:16-alpine

COPY migrations/ /docker-entrypoint-initdb.d/
