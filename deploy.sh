printf "Build now"
yarn build
cdk context --clear
cdk bootstrap
printf "Deploy lambda & API"
# insert twitter API key
cdk deploy LambdaStack --require-approval never --parameters twitterApiKey=<TWITTER_API_KEY>
printf "Deploy frontend"
cdk deploy FrontendStack --require-approval never