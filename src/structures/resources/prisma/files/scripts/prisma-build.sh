#!/bin/bash

prisma_dir="$(pwd)/prisma"
prisma_schemas="$prisma_dir/schemas"
prisma_file="$prisma_dir/schema.prisma"

provider="$1"
env_url="$2"

init_schema_message="generator client {
    provider = \"prisma-client-js\"
}

datasource db {
    provider = \"$provider\"
    url      = env(\"$env_url\")
}"

verify_folder() {
    local folder="$1"

    if [ -d "$folder" ]; then
        if [ "$(ls -A "$folder")" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

if verify_folder "$prisma_dir"; then
    if verify_folder "$prisma_schemas"; then
        echo "$init_schema_message" > "$prisma_file"

        for file in "$prisma_schemas"/*.prisma; do
            cat "$file" >> "$prisma_file"
        done

        npx prisma generate
        npx prisma format
    else
        echo "Não possui nenhum schema para carregar"
    fi
else
    echo "O diretório do prisma não existe ou está vazio"
fi