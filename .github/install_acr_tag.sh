#!/bin/bash
while getopts v:d:t: flag
do
    case "${flag}" in
        v) VERSION=${OPTARG};;
        d) INSTALL_DIR=${OPTARG};;
        t) TEMP_DIR=${OPTARG};;
    esac
done

get_latest_release() {
    curl --silent "https://api.github.com/repos/appnetwise/acr-tag/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
}

if [ -z $VERSION ] || [ $VERSION == "latest" ]; 
then
    version=$(get_latest_release)
else
    version=$VERSION
fi

mkdir -p $INSTALL_DIR
mkdir -p $TEMP_DIR
curl -L https://github.com/appnetwise/acr-tag/releases/download/${version}/acr-tag-linux-amd64.tar.gz --output $TEMP_DIR/acr-tag.tar.gz
tar -xzvf $TEMP_DIR/acr-tag.tar.gz -C $INSTALL_DIR && rm $TEMP_DIR/acr-tag.tar.gz
chmod +x $INSTALL_DIR/acr-tag
export PATH="$INSTALL_DIR:$PATH"
acr-tag version