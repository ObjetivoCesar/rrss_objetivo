const fs = require('fs');
const path = 'src/app/posts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newFunction = `  const handleSaveEdit = async (updatedPost: any) => {
    const promise = (async () => {
      const res = await fetch('/api/posts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedPost.id,
          content_text: updatedPost.content_text,
          platforms: updatedPost.platforms,
          scheduled_for: updatedPost.scheduled_for,
          status: updatedPost.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");
      return data;
    })();

    toast.promise(promise, {
      loading: 'Guardando cambios...',
      success: 'Post actualizado correctamente',
      error: (err: any) => \`Error al guardar: \${err.message}\`
    });

    try {
      await promise;
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
      setEditingPost(null);
    } catch (e) {
      // toast ya maneja el error
    }
  };`;

// Regex que busca la función handleSaveEdit completa
const regex = /const handleSaveEdit = async \(updatedPost: any\) => \{[\s\S]*?async \((updatedPost: any)\) => \{[\s\S]*?\}[\s\S]*?toast\.promise[\s\S]*?\};|const handleSaveEdit = async \(updatedPost: any\) => \{[\s\S]*?\n  \};/g;

if (regex.test(content)) {
    console.log('Match found, replacing...');
    content = content.replace(regex, newFunction);
    fs.writeFileSync(path, content);
    console.log('Successfully patched!');
} else {
    console.error('No match found for handleSaveEdit');
    // Intento secundario más simple
    const fallbackRegex = /const handleSaveEdit = async \(updatedPost: any\) => \{[\s\S]*?\n  \};/;
    if (fallbackRegex.test(content)) {
        console.log('Fallback match found, replacing...');
        content = content.replace(fallbackRegex, newFunction);
        fs.writeFileSync(path, content);
        console.log('Successfully patched (fallback)!');
    } else {
        console.error('Fallback also failed.');
        process.exit(1);
    }
}
