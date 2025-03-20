
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
    curl --silent "https://api.github.com/repos/aquasecurity/trivy/releases/latest" |     # Get latest release from GitHub api
    grep '"tag_name":' |                                                                  # Get tag line
    sed -E 's/.*"([^"]+)".*/\1/'                                                          # Pluck JSON value
}

if [ -z $VERSION ] || [ $VERSION == "latest" ]; then
    version=$(get_latest_release)
else
    version=$VERSION
fi

mkdir -p $INSTALL_DIR
mkdir -p $TEMP_DIR/trivy

curl -L https://github.com/aquasecurity/trivy/releases/download/$version/trivy_${version:1}_Linux-64bit.tar.gz --output ${TEMP_DIR}/trivy.tar.gz
tar -xzvf $TEMP_DIR/trivy.tar.gz -C $INSTALL_DIR
tar -xzvf $TEMP_DIR/trivy.tar.gz -C $TEMP_DIR/trivy && rm $TEMP_DIR/trivy.tar.gz

chmod +x $INSTALL_DIR/trivy
PATH=$INSTALL_DIR:$PATH
trivy --version