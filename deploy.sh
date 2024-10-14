printf "Build now"
yarn build
npx cdk context --clear
npx cdk bootstrap
printf "Deploy lambda & API"
# insert twitter API key
npx cdk deploy LambdaStack --require-approval never --parameters twitterApiKey=test123test
printf "Deploy frontend"
npx cdk deploy FrontendStack --require-approval never