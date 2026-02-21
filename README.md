# DenverHacks - Combined Repository

This repository contains all three variants of the DenverHacks project.

## 🌐 Live Demo

**Frontend Deployment**: Deployed on Vercel from `DenverHacks/frontend`
- Deploy from the `heet` branch
- Root Directory: `DenverHacks/frontend`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JagannathsnKU/DenverHacks&project-name=denverhacks&root-directory=DenverHacks/frontend)

## 📁 Project Structure

```
DenverHacks-Combined/
├── DenverHacks/         # Main project (Hardhat + Frontend)
├── DenverHacks-jag/     # JAG variant
└── DenverHacks-shiva/   # Shiva variant
```

## 🚀 Projects

### 1. DenverHacks (Main)
- **Description**: Main DenverHacks project with Hardhat smart contracts and Next.js frontend
- **Tech Stack**: Next.js, TypeScript, Hardhat, Prisma
- **Setup**:
  ```bash
  cd DenverHacks
  npm install
  cd frontend && npm install
  npm run dev
  ```

### 2. DenverHacks-jag
- **Description**: JAG variant with agent features
- **Tech Stack**: Next.js, TypeScript
- **Setup**:
  ```bash
  cd DenverHacks-jag
  npm install
  npm run dev
  ```

### 3. DenverHacks-shiva
- **Description**: Shiva variant focused on smart contracts
- **Tech Stack**: Hardhat, TypeScript, Prisma
- **Setup**:
  ```bash
  cd DenverHacks-shiva
  npm install
  npx hardhat compile
  ```

## 📝 Installation

Each project has its own `package.json` and dependencies. Install them separately:

```bash
# Install all dependencies
cd DenverHacks && npm install && cd ../
cd DenverHacks/frontend && npm install && cd ../../
cd DenverHacks-jag && npm install && cd ../
cd DenverHacks-shiva && npm install && cd ../
```

## 🔒 Environment Variables

Each project may require its own `.env` file. Check the respective project folders for `.env.example` files.

## � Deployment

### Deploying to Vercel

The main frontend (`DenverHacks/frontend`) can be deployed to Vercel:

1. **Import your repository** to Vercel
2. **Configure settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `DenverHacks/frontend`
   - Build Command: (auto-detected)
   - Output Directory: (auto-detected)
3. **Set Production Branch** to `heet` in Git settings
4. **Deploy**!

The `vercel.json` at the root is pre-configured for the correct directory structure.

## �📦 Branch

This is the **heet** branch containing all three project variants.

---

**Last Updated**: February 21, 2026
