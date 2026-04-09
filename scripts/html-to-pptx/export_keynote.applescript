on run argv
  set pptxPath to item 1 of argv
  set outDir to item 2 of argv

  tell application "Keynote"
    activate
    set theDoc to open (POSIX file pptxPath as alias)
    delay 2
    -- Wait for document to fully open
    repeat while (count of documents) < 1
      delay 0.2
    end repeat
    set theDoc to front document
    delay 1
    export theDoc to (POSIX file outDir as «class furl») as slide images with properties {image format:PNG, export style:IndividualSlides, skipped slides:false}
    delay 2
    close theDoc saving no
  end tell
end run
