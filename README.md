# spl-file-templates package

Atom package for creating file(s) from templates.

# Template files

The directory for the template files are defined in the settings menu for the
package. A template consist of atleast two files, a .tpl file which holds the
content and a .json file which contains the metadata.

Templates are created from the tree-view context menu, and the target files are
placed in the directory where the context menu was triggered.

# Project specific settings

A file named '.spl-file-templates' can be added to the root of the project folder
in order to create new variables or override existing ones.

Example '.spl-file-templates' file:
```
{
    "package": "Package1",
    "customvariable": "Something custom"
}
```

The default value for "package" will take precedence over what "package" has been
defined as in the plugin settings, while customvariable is a new variable definition which
will replace all occurances of {CUSTOMVARIABLE} within the template file. Any
internal variable can be overriden by using the same spelling as used in the
template files.

# Template example 1 (One file)

csharp-unity-class.json
```
{
    "templateName": "Unity3D C# Class Template",
    "files": [
        {
            "template": "csharp-unity-class.tpl",
            "extension": "cs",
            "prefix": null
        }
    ]
}
```
csharp-unity-class.tpl
```
using UnityEngine;

/*------------------------------------------------------------------------------
    Default Header

        {AUTHORNAME}
        {AUTHOREMAIL}
        {COMPANY}
        {PACKAGE}
        {DATE} {TIME}
------------------------------------------------------------------------------*/

namespace MyNamespace
{
    public class {NAME} : MonoBehaviour
    {
        public {NAME}()
        {
        }

        private void Start()
        {
        }

        private void Update()
        {
        }
    }
}
```
Which will produce a single file with {NAME} replaced by the name given when
creating the template.

# Template example 2 (Two files)

cpp-class.json
```
{
    "templateName": "C++ Class Template",
    "files": [
        {
            "template": "cpp-class-header.tpl",
            "extension": "h",
            "prefix": null
        },
        {
            "template": "cpp-class-implementation.tpl",
            "extension": "cpp",
            "prefix": null
        }
    ]
}
```
cpp-class-header.tpl
```
/*------------------------------------------------------------------------------
    Default Header

        {AUTHORNAME}
        {AUTHOREMAIL}
        {COMPANY}
        {PACKAGE}
        {DATE} {TIME}
------------------------------------------------------------------------------*/

class {NAME}
{
    public:
        {NAME}();
        virtual ~{NAME}();
};
```
cpp-class-implementation.tpl
```
#include "{NAME}.h";

{NAME}::{NAME}()
{
}

{NAME}::~{NAME}()
{
}
```
Which will produce two files with {NAME} replaced by the name given when
creating the template.
