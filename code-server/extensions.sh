extensions=(
  "apollographql.vscode-apollo"
  "bradlc.vscode-tailwindcss"
  "bruno-api-client.bruno"
  "csstools.postcss"
  "dbaeumer.vscode-eslint"
  "eamodio.gitlens"
  "editorconfig.editorconfig"
  "esbenp.prettier-vscode"
  "golang.go"
  "hashicorp.terraform"
  "ms-azuretools.vscode-docker"
  "prisma.prisma"
  "mhutchie.git-graph"
  "vscodevim.vim"
)

for extension in "${extensions[@]}"
do
  echo "----------"
  code-server --install-extension $extension --force
done
