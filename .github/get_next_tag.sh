#!/bin/bash
while getopts t:e:r:s:u:p:v: flag
do
    case "${flag}" in
        t) TAG_TYPE=${OPTARG};;
        e) BUILD_ENV=${OPTARG};;
        r) REPOSITORY=${OPTARG};;
        s) DOCKER_REGISTRY=${OPTARG};;
        u) DOCKER_USERNAME=${OPTARG};;
        p) DOCKER_PASSWORD=${OPTARG};;
        v) RELEASE_VERSION=${OPTARG};;
    esac
done

NEXT_VERSION=$(./tools/acr-tag next --environment $BUILD_ENV --registry https://$DOCKER_REGISTRY \
--username $DOCKER_USERNAME --password $DOCKER_PASSWORD --repository $REPOSITORY \
--type $TAG_TYPE)



if [[ $RELEASE_VERSION == "latest" ]]; 
then
    NEXT_TAG=$NEXT_VERSION
else
    PATTERN="v[0-9]\.[0-9]\.[0-9]"
    NEXT_VERSION=$(echo $NEXT_VERSION | sed "s/$PATTERN/$RELEASE_VERSION/g")
    NEXT_TAG=$NEXT_VERSION
fi

if [ "$TAG_TYPE" == "dev" ] || [ "$TAG_TYPE" == "uat" ] || [ "$TAG_TYPE" == "rc" ] || [ "$TAG_TYPE" == "qa" ] || [ "$TAG_TYPE" == "demo" ]; then
    NEXT_TAG="${NEXT_TAG}-$(date +%Y%m%d%H%M%S)"
fi

echo $NEXT_TAG
