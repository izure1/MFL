import styled from '@emotion/styled'

export default styled.div`
  animation:
    rotate-colorful-gradient 11s linear infinite,
    move-colorful-gradient 4s linear infinite alternate;
  background-image: linear-gradient(var(--colorful-gradient-angle), #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-clip: text;
  background-size: 400%;
  background-position: var(--colorful-gradient-position);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`
