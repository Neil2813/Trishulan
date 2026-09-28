import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  return res.json({
    message: "Welcome to Trishulan API",
    status: "success",
    timestamp: new Date().toISOString()
  });
});

export default router;
