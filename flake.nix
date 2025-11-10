{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    utils,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };
      in rec {
        devShells.default = pkgs.mkShell {
          name = "capstone-au2025";
          packages = with pkgs; [
            nodejs
            typescript-language-server
            go
            gopls
            go-tools
            air
            uv
            opentofu
            opentofu-ls
            kubectl
            kubelogin-oidc
            typst
          ];
          GOFLAGS = "-tags=aws,ollama";
        };
      }
    );
}
