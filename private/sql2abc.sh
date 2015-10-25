# Getting my data
LIST=`sqlite3 folkwiki.se.db "SELECT id FROM tune"`;

# For each row
for ROW in $LIST; do

	# Parsing data (sqlite3 returns a pipe separated string)
	printf -v Id "%05d" $ROW;	
	#Id=`echo $ROW`;
	Name=`sqlite3 folkwiki.se.db "SELECT name FROM tune WHERE id = $ROW"`;
        RESULT=$(sed 's/\//-/g' <<< "$Name")
	
	# Printing my data
	echo  $RESULT;
	Fname="$Id - $RESULT.abc";
	sqlite3 folkwiki.se.db "SELECT abc FROM tune WHERE id = $ROW" > "$Fname";
        mv "$Fname" temp.abc	
	sed 's/(:music:)//' temp.abc > temp2.abc;        	
	sed 's/(:musicend:)//' temp2.abc > "$Fname";        	
	abc2midi "$Fname";
done
