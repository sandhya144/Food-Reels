# Savora

Savora is a modern, luxury restaurant website designed to blend elegant visual storytelling with a refined dining experience. The website features a cinematic dark aesthetic, smooth animations, curated food presentation, and an intuitive navigation experience.

Built with a focus on premium UI/UX, responsive design, and immersive interactions, Savora showcases how a restaurant brand can turn its digital presence into an extension of the dining experience.

### Highlights

* Elegant, responsive restaurant interface
* Premium dark-themed visual design
* Smooth animations and interactive transitions
* Menu, gallery, story, and dining spaces sections
* Mobile and desktop optimized
* Modern typography and refined visual details

## Local development

1. Configure the required backend values in `backend/.env` (`MONGODB_URI`, `JWT_SECRET`, and the three `IMAGEKIT_*` values).
2. Start the API from the `backend` directory with `npm run dev`.
3. In a separate terminal, start the frontend from the `frontend` directory with `npm run dev`.

The frontend development server proxies `/api` requests to `http://127.0.0.1:3000`. For a separately hosted API, set `VITE_API_URL` to its `/api` base URL.

# In Progress 