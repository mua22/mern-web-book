
## Quick Start

1. Install Python (if not already installed)

2. Install MkDocs and Material theme for your user:

```bat
python -m pip install --user mkdocs mkdocs-material
```

3. Start the site locally:

```bat
python -m mkdocs serve --dev-addr=127.0.0.1:8000 --livereload
```

4. Open your browser and visit:

```
http://localhost:8000
```

5. Deploy to GitHub Pages:

```bat
python -m mkdocs gh-deploy
```

> ✅ Notes:
>
> * Using `--user` avoids Windows permission errors.
> * Using `python -m mkdocs` ensures the command works even if `mkdocs` is not on your PATH.
> * `gh-deploy` will automatically build your site and push it to the `gh-pages` branch on GitHub.
