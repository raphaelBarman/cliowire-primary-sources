# ArgusServer
Wrapper around argusSearch for creating an api endpoint

Request: localhost:8080/search/{query}?case={case}&escape={escape}&expert={expert}&keywork={keyword}

Where {query} is the query string.

Then all arguments are boolean and optional, default values are case=True, escape=False, expert=False, keyword=False.
For more details about argument, cf. ArgusSearch documentation

## Installation
We first need to add libs from ArgusSearch:

From the ArgusSearch2.0/PLANET\_ArgusSearch\_SDK\_2.0.0/lib library, run:
- mvn install:install-file -Dfile=TED_ArgusSearch_SDK_2_20170705.jar -DgroupId=de.planet -DartifactId=ted_argussearch_sdk -Dversion=2-2017-07-05 -Dpackaging=jar
- mvn install:install-file -Dfile=imaging.jar -DgroupId=de.planet -DartifactId=imaging -Dversion=2-2017-07-05 -Dpackaging=jar
- mvn install:install-file -Dfile=math.jar -DgroupId=de.planet -DartifactId=math -Dversion=2-2017-07-05 -Dpackaging=jar
- mvn install:install-file -Dfile=misc.jar -DgroupId=com.achteck -DartifactId=misc -Dversion=20170621 -Dpackaging=jar

## Usage
mvn -e exec:java

