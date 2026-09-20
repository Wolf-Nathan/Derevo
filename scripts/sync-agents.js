const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const targets = [
    { src: 'audit-agent.md', dest: '.claude/agents/audit-agent.md' },
    { src: 'audit-agent.md', dest: '.github/agents/audit-agent.agent.md' },
    { src: 'fix-agent.md', dest: '.claude/agents/fix-agent.md' },
    { src: 'fix-agent.md', dest: '.github/agents/fix-agent.agent.md' },
];

for (const { src, dest } of targets) {
    const content = fs.readFileSync(path.join(root, 'agents', src), 'utf8');
    fs.mkdirSync(path.dirname(path.join(root, dest)), { recursive: true });
    fs.writeFileSync(path.join(root, dest), content);
    console.log('synced ' + dest);
}
