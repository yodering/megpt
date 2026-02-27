const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ]
  },
}

export default nextConfig
