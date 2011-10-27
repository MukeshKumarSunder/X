# imports
import os, sys
# WRITE XML
from xml.dom import minidom
# GET DATE
import datetime
from time import time, gmtime, strftime
#from cElementTree.SimpleXMLWriter import XMLWriter

# xtk-utils dir
def main():
  xtkUtilsDir = os.path.abspath( os.path.dirname( sys.argv[0] ) )

  f = open( xtkUtilsDir + os.sep + 'test.xml', 'r' );
  f1 = open( xtkUtilsDir + os.sep + 'test.xml', 'r' );

  count = 0
  data = f.readlines()

  xml = minidom.Document()

  siteElement = xml.createElement('Site')

  siteElement.setAttribute('BuildName', 'Darwin-c++')

  now = datetime.datetime.now()
  buildtime = str(now.year) + str(now.month) + str(now.day) + "-" + str(now.minute) + str(now.second)
  buildtype = 'Experimental'
  buildstamp = buildtime + '-' + buildtype
  siteElement.setAttribute('BuildStamp', buildstamp)
  siteElement.setAttribute('Name', 'starfish.megason-lab')
  siteElement.setAttribute('Hostname', 'starfish')

  xml.appendChild(siteElement)


  buildElement = xml.createElement('Build')
  siteElement.appendChild(buildElement)

  startDateTimeElement = xml.createElement('StartDateTime')
  buildElement.appendChild(startDateTimeElement)
  startDateTime = xml.createTextNode(strftime("%b %d %H:%M %Z", gmtime()))
  startDateTimeElement.appendChild(startDateTime)
  
  startBuildTimeElement = xml.createElement('StartBuildTime')
  buildElement.appendChild(startBuildTimeElement)
  startBuildTime = xml.createTextNode(str(time()))
  startBuildTimeElement.appendChild(startBuildTime)
  
  buildCommandElement = xml.createElement('BuildCommand')
  buildElement.appendChild(buildCommandElement)
  buildCommand = xml.createTextNode("This is a build command")
  buildCommandElement.appendChild(buildCommand)

  endDateTimeElement = xml.createElement('EndDateTime')
  buildElement.appendChild(endDateTimeElement)
  endDateTime = xml.createTextNode(strftime("%b %d %H:%M %Z", gmtime()))
  endDateTimeElement.appendChild(endDateTime)
  
  endBuildTimeElement = xml.createElement('EndBuildTime')
  buildElement.appendChild(endBuildTimeElement)
  endBuildTime = xml.createTextNode(str(time()))
  endBuildTimeElement.appendChild(endBuildTime)
  
  elapsedMinutesElement = xml.createElement('ElapsedMinutes')
  buildElement.appendChild(elapsedMinutesElement)
  elapsedMinutes = xml.createTextNode("0")
  elapsedMinutesElement.appendChild(elapsedMinutes)


#  errorElement = xml.createElement('Error')
#  buildElement.appendChild(errorElement)

  parsefile(f1, count, len(data) - 14, buildElement, xml)
  
  f2 = open('Build.xml', 'w')
  f2.write(xml.toxml())
  f2.close()
  #  w = elementtree.XMLWriter("BuildTest.xml")
  #  xml = w.start("xml") 
 

# read first builded file, then create method to loop
#for line in f:
#        print line,
def parsefile(f, count, numberoflines, buildElement, xml):
  #base case
  if( count >= numberoflines):
    return

  f.readline()
  f.readline();
  f.readline();
  count +=3

  #build command
  line = f.readline()
  count += 1

  #succeed or warnings!
  successline = f.readline()
  success = successline.find("succeeded")
  count += 1

  if (success < 0) :
    while (successline.find("error(s)") < 0) :
      warning = successline.find('WARNING')
      if(warning>0):
        error = successline
        errorElement = xml.createElement('Warning')
        buildElement.appendChild(errorElement)
        
        buildLogLineElement = xml.createElement('BuildLogLine')
        errorElement.appendChild(buildLogLineElement)
        buildLogLine = xml.createTextNode(str(count))
        buildLogLineElement.appendChild(buildLogLine)
        
        textWarningElement = xml.createElement('Text')
        errorElement.appendChild(textWarningElement)
        errorNode = xml.createTextNode(error)
        textWarningElement.appendChild(errorNode)
        
        sourceFileElement = xml.createElement('SourceFile')
        errorElement.appendChild(sourceFileElement)
        sourceFile = xml.createTextNode(error.split(':')[0])
        sourceFileElement.appendChild(sourceFile)
       
        sourceLineNumberElement = xml.createElement('SourceLineNumber')
        errorElement.appendChild(sourceLineNumberElement)
        sourceLineNumber = xml.createTextNode(error.split(':')[1].split(':')[0])
        sourceLineNumberElement.appendChild(sourceLineNumber)

        successline = f.readline()
        count += 1
        successline2 = f.readline()
        count += 1
     
        postContextElement = xml.createElement('PostContext')
        errorElement.appendChild(postContextElement)
        postContext = xml.createTextNode(successline + '\n' + successline2)
        postContextElement.appendChild(postContext)

        successline = f.readline()
        count += 1

      successline = f.readline()
      count += 1
      
    successline = f.readline()
    count += 1
  
  #recursive call
  parsefile(f, count, numberoflines, buildElement, xml)


if __name__ == "__main__":
    main()
    command = "ctest -S xtk.cmake -V"
    os.system(command)
