Systematic Review Assistant
===========================
The Systematic Review Assistant (SRA) project is based at the [Bond University Center for Research in Evidence-Based Practice](http://crebp.net.au) was originally conceived under the aim of drastically reducing the amount of time it takes to construct a Systematic Review using Information Technology.

The assistance it gives researches when constructing reviews is split into a number of different modules:

* Search Strategy Optimization - Providing various 'hooks' into the main citation search engines, the SRA project allows for easy consolidation and collection of references which may be used in the systematic review.
* Reference Deduplication - As most searches use multiple search engines and sources it is necessary to locate, merge and/or eliminate duplicate references before continuing onto the next stages.
* Initial screening - Providing a simple 'skim reading' interface to quickly categorize all references found in the previous stages as valuable, for reference only or eliminate from future study.
* Finding full text references - In partnership with other research projects it is an eventual aim of the SRA project to automatically locate and obtain full-text papers for all references from the previous stages.
* Screening full text - An extension of the initial screening stage, this allows for the closer screening of articles based on their full-text content.
* Multiple researcher consolidation - Providing the ability for multiple researchers to assess references from any of the previous screening stages.

SRA is built using the [PHP](http://www.php.net) Programming language using the [CodeIgniter](http://ellislab.com/codeigniter) framework, [MySQL](https://www.mysql.com) database storage as well as specially developed modules for [importing and exporting EndNote reference libraries](https://github.com/hash-bang/PHP-EndNote).

The project is available open source via GitHub at https://github.com/CREBP/SRA


EndNote compatibility
---------------------
EndNote forms a central tool to most researchers so the SRA project aims to work in tandem with EndNote as far as possible.
At present this functionality is reflected in the ability to import or export reference collections from the SRA project with minimal data loss via the EndNote XML format.


Reference Deduplication
-----------------------
The deduplication module is the first major module in the SRA project. Since most reference searches can provide similar results the purpose of the deduplicator is to merge these semi-identical references together 'fuzzy' matching criteria. At present the system uses a number of different matching techniques (e.g. similarity of title or author names after dis-guarding misleading punctuation).

Over time other methods of detecting matches have been developed such as standardising and checking page references (e.g. 'pages 345-352' is the same semantically as 'pages 345-52') which assist in matching references which may have been rewritten to conform to the search engine standards they were originally retrieved from.

Upon locating a reference the SRA software will either merge the references (where applicable) or present the researcher with choices on what conflicting information was found when doing so.

The process of performing a duplication operation is as follows:

1. Import one or more existing EndNote reference libraries
2. Select 'Deduplication' from the reference library drop-down menu
3. The SRA software will take a few moments to perform its processing
4. If any conflicting information is detected the researcher can now select which of the various pieces of data should be used in the 'final' citation
5. The dedplicated library can now be exported back to EndNote


Goals
=====
* Integrated citation management tools including various functionality useful to Systematic Review creation
* Federalized search engine aimed specifically at Systematic Reviews
* Multiple-user abstract / full-text screening process
* Automated Abstract and Method section creation tools
* Tools useful to Systematic Reviews - Forest Plots and various other outputs
