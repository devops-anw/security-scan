#!/bin/bash
while getopts i:e:t: flag
do
    case "${flag}" in
        i) IMAGE=${OPTARG};;
        e) BUILD_ENV=${OPTARG};;
        t) IMAGE_TAG=${OPTARG};;
    esac
done

for targz in $(find . -type f -name "*.tar.gz")
do
    gunzip $targz
    docker load -q -i ${targz:0:-3}
done

TEMP_IMAGE=$(docker image ls --format {{.Repository}}:{{.Tag}} | grep $IMAGE) || true
TARGET_REPO=$(docker image ls --format {{.Repository}} | grep $IMAGE) || true

echo $TEMP_IMAGE
echo $TARGET_REPO
echo $IMAGE_TAG
docker tag $TEMP_IMAGE $TARGET_REPO:$IMAGE_TAG
docker push $TARGET_REPO:$IMAGE_TAG
docker tag $TEMP_IMAGE $TARGET_REPO:latest-$BUILD_ENV
docker push $TARGET_REPO:latest-$BUILD_ENV

if [[ $BUILD_ENV == "prod" ]]; then
    echo "Re-tagging images due to Prod release."
    docker tag $TEMP_IMAGE $TARGET_REPO:$IMAGE_TAG-dev.0
    docker tag $TEMP_IMAGE $TARGET_REPO:$IMAGE_TAG-qa.0
    docker push $TARGET_REPO:$IMAGE_TAG-dev.0
    docker push $TARGET_REPO:$IMAGE_TAG-qa.0
fi